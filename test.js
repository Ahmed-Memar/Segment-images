// Rule identifier for the plugin
const ruleId = 'EX-CS009';

// Debug logger for troubleshooting
const debug = require('debug')('apigeelint:' + ruleId);

// XPath for XML parsing
const xpath = require('xpath');

// Import helper functions from security-lib
const {
  getPoliciesByType,
  getFlows,
  getStepName,
  getPreFlowRequestSteps,
  getFlowRequestSteps,
  findFlowsNotMatching
} = require('./lib/security-lib.js');

// Plugin metadata definition
const plugin = {
  ruleId: ruleId,
  name: "Check Access Token Control",
  message: "Ensure APIs validate access tokens using OAuthV2 VerifyAccessToken or VerifyJWT.",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true
};

// Helper to safely extract text from XML node
const getNodeText = node =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';

// Check if OAuthV2 policy is used for VerifyAccessToken
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

// Retrieve valid access token validation policies (OAuthV2 or VerifyJWT)
const getValidAccessTokenPolicies = endpoint => {
  const oauthPolicies = getPoliciesByType(endpoint, 'OAuthV2')
    .filter(isVerifyAccessTokenPolicy);

  const verifyJwtPolicies = getPoliciesByType(endpoint, 'VerifyJWT');

  return [...oauthPolicies, ...verifyJwtPolicies];
};

// Extract names of valid access token policies
const getValidAccessTokenPolicyNames = endpoint =>
  getValidAccessTokenPolicies(endpoint).map(policy => policy.getName());

// Check if a given policy name is a valid access token validator
const isValidAccessTokenPolicyUsed = (endpoint, policyName) =>
  getValidAccessTokenPolicyNames(endpoint).includes(policyName);

// Check if PreFlow enforces access token validation
const checkPreFlowProtection = endpoint => {
  const steps = getPreFlowRequestSteps(endpoint);

  return steps.some(step =>
    isValidAccessTokenPolicyUsed(endpoint, getStepName(step))
  );
};

// Main function executed on each proxy endpoint
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  const el = endpoint.getElement();
  const line = el.lineNumber;
  const column = el.columnNumber;

  // Get all valid access token validation policies
  const validPolicies = getValidAccessTokenPolicies(endpoint);
  const validPolicyNames = validPolicies.map(policy => policy.getName());

  // 1. Fail if no validation policy exists
  if (validPolicies.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'API does not implement access token validation. Missing OAuthV2 VerifyAccessToken or VerifyJWT policy.'
    });

    return cb(null, true);
  }

  // 2. Pass if validation is enforced globally in PreFlow
  if (checkPreFlowProtection(endpoint)) {
    return cb(null, false);
  }

  const flows = getFlows(endpoint);

  // 3. Fail if no flows and no PreFlow protection
  if (flows.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'API defines validation policies but does not enforce them in PreFlow or flows.'
    });

    return cb(null, true);
  }

  // 4. Validate each flow contains access token validation
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow);

    const hasAccessTokenValidation = steps.some(step =>
      validPolicyNames.includes(getStepName(step))
    );

    const details = [];

    if (!hasAccessTokenValidation) {
      details.push({
        message: 'missing access token validation (OAuthV2 VerifyAccessToken or VerifyJWT)',
        line: flow.lineNumber,
        column: flow.columnNumber
      });
    }

    return {
      isValid: hasAccessTokenValidation,
      details
    };
  });

  // 5. Fail if some flows are not protected
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

  // 6. Pass if all checks are satisfied
  return cb(null, false);
};

// Export plugin entry points
module.exports = {
  plugin,
  onProxyEndpoint,
};