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

/**
 * Plugin definition
 * @type {Object}
 */
const plugin = {
  ruleId: ruleId,
  name: "Check Access Token Control",
  message: "Ensure APIs validate access tokens using OAuthV2 VerifyAccessToken or VerifyJWT.",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true
};

/**
 * Warning version of plugin
 * @type {Object}
 */
const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;


/**
 * Safely extract text from XML node
 * @param {Object} node - XML node
 * @returns {string} trimmed text content or empty string
 */
const getNodeText = (node) =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : "";

/**
 * Get first node from XPath query
 * @param {string} path - XPath expression
 * @param {Object} el - XML element
 * @returns {Object|null} first matching node or null
 */
const getFirstNode = (path, el) => xpath.select(path, el)[0];

/**
 * Classify JWT algorithm
 * @param {string} algorithm - algorithm value from policy
 * @returns {Object} classification result
 * @returns {string} returns.status - approved | legacy | forbidden | unsupported
 * @returns {string|null} returns.family - HS | RS | PS | ES or null
 * @returns {string} returns.value - original algorithm value
 */
const classifyJwtAlgorithm = (algorithm) => {
  const value = (algorithm || '').trim().toUpperCase();

  const approvedRegex = /^(HS|PS|ES)(256|384|512)$/;
  const legacyRegex = /^RS(256|384|512)$/;

  if (approvedRegex.test(value)) {
    return { status: 'approved', family: value.slice(0, 2), value };
  }

  if (legacyRegex.test(value)) {
    return { status: 'legacy', family: 'RS', value };
  }

  if (value === 'NONE') {
    return { status: 'forbidden', family: null, value };
  }

  return { status: 'unsupported', family: null, value };
};

/**
 * Check if SecretKey exists
 * @param {Object} el - XML element
 * @returns {boolean}
 */
const hasSecretKey = (el) =>
  !!getFirstNode('/VerifyJWT/SecretKey', el);

/**
 * Check if PublicKey exists
 * @param {Object} el - XML element
 * @returns {boolean}
 */
const hasPublicKey = (el) =>
  !!getFirstNode('/VerifyJWT/PublicKey', el);

/**
 * Check if policy is VerifyAccessToken
 * @param {Object} policy - Apigee policy object
 * @returns {boolean}
 */
const isVerifyAccessTokenPolicy = (policy) => {
  const el = policy.getElement();
  const operationNode = xpath.select('/OAuthV2/Operation', el)[0];
  const operationValue = getNodeText(operationNode);

  return /^VerifyAccessToken$/i.test(operationValue);
};

/**
 * Retrieve all access token validation policies
 * @param {Object} endpoint - proxy endpoint
 * @returns {Array<Object>} list of policies
 */
const getValidAccessTokenPolicies = (endpoint) => {
  const oauthPolicies = getPoliciesByType(endpoint, 'OAuthV2')
    .filter(isVerifyAccessTokenPolicy);

  const verifyJwtPolicies = getPoliciesByType(endpoint, 'VerifyJWT');

  return [...oauthPolicies, ...verifyJwtPolicies];
};

/**
 * Extract names of access token validation policies
 * @param {Object} endpoint
 * @returns {Array<string>}
 */
const getValidAccessTokenPolicyNames = (endpoint) =>
  getValidAccessTokenPolicies(endpoint).map(p => p.getName());

/**
 * Check if policy is used in endpoint
 * @param {Object} endpoint
 * @param {string} policyName
 * @returns {boolean}
 */
const isValidAccessTokenPolicyUsed = (endpoint, policyName) =>
  getValidAccessTokenPolicyNames(endpoint).includes(policyName);

/**
 * Check if PreFlow enforces validation
 * @param {Object} endpoint
 * @returns {boolean}
 */
const checkPreFlowProtection = (endpoint) => {
  const steps = getPreFlowRequestSteps(endpoint);

  return steps.some(step =>
    isValidAccessTokenPolicyUsed(endpoint, getStepName(step))
  );
};

/**
 * Main plugin logic
 * @param {Object} endpoint - proxy endpoint
 * @param {Function} cb - callback
 */
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  const el = endpoint.getElement();
  const line = el.lineNumber;
  const column = el.columnNumber;

  const validPolicies = getValidAccessTokenPolicies(endpoint);
  const validPolicyNames = validPolicies.map(p => p.getName());

  // 1. No validation policy
  if (validPolicies.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message: 'Missing access token validation (OAuthV2 or VerifyJWT).'
    });
    return cb(null, true);
  }

  // 2. PreFlow protection OK
  if (checkPreFlowProtection(endpoint)) {
    return cb(null, false);
  }

  const flows = getFlows(endpoint);

  // 3. No flows
  if (flows.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message: 'Validation policies exist but are not enforced.'
    });
    return cb(null, true);
  }

  // 4. Validate each flow
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow);

    const hasValidation = steps.some(step =>
      validPolicyNames.includes(getStepName(step))
    );

    return {
      isValid: hasValidation,
      details: hasValidation ? [] : [{
        message: 'Missing access token validation',
        line: flow.lineNumber,
        column: flow.columnNumber
      }]
    };
  });

  if (invalidFlows.length > 0) {
    invalidFlows.forEach(flow => {
      endpoint.addMessage({
        plugin,
        line: flow.line,
        column: flow.column,
        message: `Flow "${flow.name}" is not compliant`
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