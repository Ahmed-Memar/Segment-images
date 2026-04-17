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

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

// Helper to safely extract text from XML node
const getNodeText = node =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';

// Helper to get the first matching XPath node
const getFirstNode = (expression, el) => xpath.select(expression, el)[0];

// Helper to get a node line number with fallback
const getNodeLine = (node, fallbackLine) =>
  node && node.lineNumber ? node.lineNumber : fallbackLine;

// Helper to get a node column number with fallback
const getNodeColumn = (node, fallbackColumn) =>
  node && node.columnNumber ? node.columnNumber : fallbackColumn;

// Helper to normalize boolean values
const isTrueValue = value => /^true$/i.test((value || '').trim());

// Helper to classify supported JWT algorithms
const getAlgorithmFamily = algorithm => {
  const value = (algorithm || '').trim().toUpperCase();

  if (/^HS(256|384|512)$/.test(value)) {
    return 'HS';
  }

  if (/^RS(256|384|512)$/.test(value)) {
    return 'RS';
  }

  if (/^PS(256|384|512)$/.test(value)) {
    return 'PS';
  }

  if (/^ES(256|384|512)$/.test(value)) {
    return 'ES';
  }

  return null;
};

// Helper to parse TimeAllowance into seconds
const parseTimeAllowanceToSeconds = rawValue => {
  if (!rawValue) {
    return null;
  }

  const value = rawValue.trim().toLowerCase();
  const match = value.match(/^(\d+)\s*(ms|s|m|h)?$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2] || 's';

  switch (unit) {
    case 'ms':
      return amount / 1000;
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 3600;
    default:
      return null;
  }
};

// Check if OAuthV2 policy is used for VerifyAccessToken
const isVerifyAccessTokenPolicy = policy => {
  const el = policy.getElement();
  const operationNode = getFirstNode('/OAuthV2/Operation', el);
  const operationValue = getNodeText(operationNode);

  return /^VerifyAccessToken$/i.test(operationValue);
};

// Check if VerifyJWT policy contains a hardcoded Value
const hasHardcodedValue = parentNode => {
  if (!parentNode) {
    return false;
  }

  const valueNode = getFirstNode('./Value', parentNode);
  if (!valueNode) {
    return false;
  }

  const refAttr = getFirstNode('./Value/@ref', parentNode);
  if (refAttr) {
    return false;
  }

  return getNodeText(valueNode) !== '';
};

// Check if VerifyJWT policy contains a usable SecretKey
const hasSecretKey = el => {
  const secretKeyNode = getFirstNode('/VerifyJWT/SecretKey', el);
  if (!secretKeyNode) {
    return false;
  }

  const valueNode = getFirstNode('/VerifyJWT/SecretKey/Value', el);
  return !!valueNode;
};

// Check if VerifyJWT policy contains a usable PublicKey
const hasPublicKey = el => {
  const publicKeyNode = getFirstNode('/VerifyJWT/PublicKey', el);
  if (!publicKeyNode) {
    return false;
  }

  const valueNode = getFirstNode('/VerifyJWT/PublicKey/Value', el);
  const certificateNode = getFirstNode('/VerifyJWT/PublicKey/Certificate', el);
  const jwksNode = getFirstNode('/VerifyJWT/PublicKey/JWKS', el);

  return !!(valueNode || certificateNode || jwksNode);
};

// Analyze VerifyJWT policy configuration
const analyzeVerifyJwtPolicy = policy => {
  const el = policy.getElement();
  const policyName = policy.getName();
  const policyLine = el.lineNumber;
  const policyColumn = el.columnNumber;

  const errors = [];
  const warnings = [];

  const algorithmNode = getFirstNode('/VerifyJWT/Algorithm', el);
  const algorithmValue = getNodeText(algorithmNode);
  const algorithmFamily = getAlgorithmFamily(algorithmValue);

  const audienceNode = getFirstNode('/VerifyJWT/Audience', el);
  const audienceValue = getNodeText(audienceNode);

  const issuerNode = getFirstNode('/VerifyJWT/Issuer', el);
  const issuerValue = getNodeText(issuerNode);

  const ignoreNode = getFirstNode('/VerifyJWT/IgnoreUnresolvedVariables', el);
  const ignoreValue = getNodeText(ignoreNode);

  const timeAllowanceNode = getFirstNode('/VerifyJWT/TimeAllowance', el);
  const timeAllowanceValue = getNodeText(timeAllowanceNode);
  const timeAllowanceSeconds = parseTimeAllowanceToSeconds(timeAllowanceValue);

  const secretKeyNode = getFirstNode('/VerifyJWT/SecretKey', el);
  const publicKeyNode = getFirstNode('/VerifyJWT/PublicKey', el);

  // Validate Algorithm
  if (!algorithmValue) {
    errors.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" must define <Algorithm>.`
    });
  } else if (/^none$/i.test(algorithmValue)) {
    errors.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" must not use Algorithm "none".`
    });
  } else if (!algorithmFamily) {
    errors.push({
      line: getNodeLine(algorithmNode, policyLine),
      column: getNodeColumn(algorithmNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" uses an unsupported Algorithm "${algorithmValue}".`
    });
  }

  // Validate key presence according to algorithm family
  if (algorithmFamily === 'HS') {
    if (!hasSecretKey(el)) {
      errors.push({
        line: getNodeLine(secretKeyNode, policyLine),
        column: getNodeColumn(secretKeyNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" must define <SecretKey> for ${algorithmValue}.`
      });
    }
  }

  if (algorithmFamily === 'RS' || algorithmFamily === 'PS' || algorithmFamily === 'ES') {
    if (!hasPublicKey(el)) {
      errors.push({
        line: getNodeLine(publicKeyNode, policyLine),
        column: getNodeColumn(publicKeyNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" must define <PublicKey> (Value, Certificate, or JWKS) for ${algorithmValue}.`
      });
    }
  }

  // Validate Audience
  if (!audienceValue) {
    errors.push({
      line: getNodeLine(audienceNode, policyLine),
      column: getNodeColumn(audienceNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" must define <Audience>.`
    });
  }

  // Validate IgnoreUnresolvedVariables
  if (isTrueValue(ignoreValue)) {
    errors.push({
      line: getNodeLine(ignoreNode, policyLine),
      column: getNodeColumn(ignoreNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" must not enable <IgnoreUnresolvedVariables>true</IgnoreUnresolvedVariables>.`
    });
  }

  // Validate TimeAllowance thresholds
  if (timeAllowanceValue) {
    if (timeAllowanceSeconds === null) {
      warnings.push({
        line: getNodeLine(timeAllowanceNode, policyLine),
        column: getNodeColumn(timeAllowanceNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" uses a non-literal or unsupported <TimeAllowance> value "${timeAllowanceValue}", which cannot be statically evaluated.`
      });
    } else if (timeAllowanceSeconds > 14400) {
      errors.push({
        line: getNodeLine(timeAllowanceNode, policyLine),
        column: getNodeColumn(timeAllowanceNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" defines <TimeAllowance>${timeAllowanceValue}</TimeAllowance>, which exceeds 4 hours.`
      });
    } else if (timeAllowanceSeconds > 600) {
      warnings.push({
        line: getNodeLine(timeAllowanceNode, policyLine),
        column: getNodeColumn(timeAllowanceNode, policyColumn),
        message: `VerifyJWT policy "${policyName}" defines <TimeAllowance>${timeAllowanceValue}</TimeAllowance>, which exceeds 10 minutes.`
      });
    }
  }

  // Warn if Issuer is absent
  if (!issuerValue) {
    warnings.push({
      line: getNodeLine(issuerNode, policyLine),
      column: getNodeColumn(issuerNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" should define <Issuer>.`
    });
  }

  // Warn if SecretKey value is hardcoded
  if (hasHardcodedValue(secretKeyNode)) {
    warnings.push({
      line: getNodeLine(secretKeyNode, policyLine),
      column: getNodeColumn(secretKeyNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" should avoid hardcoded <SecretKey><Value> and use ref= instead.`
    });
  }

  // Warn if PublicKey value is hardcoded
  if (hasHardcodedValue(publicKeyNode)) {
    warnings.push({
      line: getNodeLine(publicKeyNode, policyLine),
      column: getNodeColumn(publicKeyNode, policyColumn),
      message: `VerifyJWT policy "${policyName}" should avoid hardcoded <PublicKey><Value> and use ref= instead.`
    });
  }

  return {
    policy,
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Retrieve valid access token validation policies and VerifyJWT analysis
const getAccessTokenPolicyAnalysis = endpoint => {
  const oauthPolicies = getPoliciesByType(endpoint, 'OAuthV2')
    .filter(isVerifyAccessTokenPolicy);

  const verifyJwtAnalyses = getPoliciesByType(endpoint, 'VerifyJWT')
    .map(analyzeVerifyJwtPolicy);

  const validVerifyJwtPolicies = verifyJwtAnalyses
    .filter(result => result.isValid)
    .map(result => result.policy);

  return {
    oauthPolicies,
    verifyJwtAnalyses,
    validPolicies: [...oauthPolicies, ...validVerifyJwtPolicies]
  };
};

// Extract names of valid access token policies
const getValidAccessTokenPolicyNames = endpoint =>
  getAccessTokenPolicyAnalysis(endpoint).validPolicies.map(policy => policy.getName());

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

  let hasErrors = false;

  // Get OAuth and VerifyJWT policy analysis
  const {
    verifyJwtAnalyses,
    validPolicies
  } = getAccessTokenPolicyAnalysis(endpoint);

  const validPolicyNames = validPolicies.map(policy => policy.getName());

  // Report VerifyJWT errors and warnings
  verifyJwtAnalyses.forEach(result => {
    result.errors.forEach(issue => {
      hasErrors = true;
      endpoint.addMessage({
        plugin,
        line: issue.line,
        column: issue.column,
        message: issue.message
      });
    });

    result.warnings.forEach(issue => {
      endpoint.addMessage({
        plugin: warningPlugin,
        line: issue.line,
        column: issue.column,
        message: issue.message
      });
    });
  });

  // 1. Fail if no valid validation policy exists
  if (validPolicies.length === 0) {
    hasErrors = true;
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'Missing access token validation: no OAuthV2 VerifyAccessToken or properly configured VerifyJWT policy found.'
    });

    return cb(null, hasErrors);
  }

  // 2. Pass global flow coverage check if validation is enforced in PreFlow
  if (checkPreFlowProtection(endpoint)) {
    return cb(null, hasErrors);
  }

  const flows = getFlows(endpoint);

  // 3. Fail if no flows and no PreFlow protection
  if (flows.length === 0) {
    hasErrors = true;
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'API defines access token validation policies but does not enforce them in PreFlow or flows.'
    });

    return cb(null, hasErrors);
  }

  // 4. Validate each flow contains a valid access token validation policy
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow);

    const hasAccessTokenValidation = steps.some(step =>
      validPolicyNames.includes(getStepName(step))
    );

    const details = [];

    if (!hasAccessTokenValidation) {
      details.push({
        message: 'missing valid access token validation (OAuthV2 VerifyAccessToken or compliant VerifyJWT)',
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
    hasErrors = true;

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

  // 6. Return final status
  return cb(null, hasErrors);
};

module.exports = {
  plugin,
  onProxyEndpoint,
};