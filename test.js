const ruleId = 'EX-CS010';

const debug = require('debug')('apigeelint:' + ruleId);

const {
  getFirstNode,
  getNodeLine,
  getNodeColumn
} = require('./lib/security-lib.js');

const plugin = {
  ruleId: ruleId,
  name: 'Check Exception and Error Management',
  message:
    'Ensure APIs define exception and error handling using FaultRules or DefaultFaultRule.',
  fatal: false,
  severity: 2,
  nodeType: 'Bundle',
  enabled: true
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

/**
 * Return the root XML node name of an endpoint.
 *
 * Examples:
 * - ProxyEndpoint
 * - TargetEndpoint
 *
 * @param {Object} endpoint
 * @returns {string}
 */
const getEndpointRootName = endpoint =>
  endpoint.getElement().nodeName;

/**
 * Check whether an XML node contains at least one element child.
 *
 * @param {Object} node
 * @returns {boolean}
 */
const hasChildElement = node =>
  node &&
  Array.from(node.childNodes || []).some(child => child.nodeType === 1);

/**
 * Check whether the endpoint defines a DefaultFaultRule
 * containing at least one child element.
 *
 * A non-empty DefaultFaultRule is considered
 * the preferred error-handling mechanism.
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasDefaultFaultRule = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const defaultFaultRule =
    getFirstNode(`/${rootName}/DefaultFaultRule`, el);

  return hasChildElement(defaultFaultRule);
};

/**
 * Check whether the endpoint defines at least one FaultRule
 * containing at least one child element.
 *
 * FaultRules without a DefaultFaultRule are considered
 * partially compliant and generate a warning.
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasNonEmptyFaultRules = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  const faultRule =
    getFirstNode(`/${rootName}/FaultRules/FaultRule`, el);

  return hasChildElement(faultRule);
};

/**
 * Determine the endpoint compliance status.
 *
 * PASS:
 * - Non-empty DefaultFaultRule exists
 *
 * WARNING:
 * - Non-empty FaultRule exists
 * - No DefaultFaultRule exists
 *
 * ERROR:
 * - No valid error-handling mechanism exists
 *
 * @param {Object} endpoint
 * @returns {'PASS'|'WARNING'|'ERROR'}
 */
const getComplianceStatus = endpoint => {
  const hasDefault = hasDefaultFaultRule(endpoint);
  const hasFaultRule = hasNonEmptyFaultRules(endpoint);

  if (hasDefault) {
    return 'PASS';
  }

  if (hasFaultRule) {
    return 'WARNING';
  }

  return 'ERROR';
};

/**
 * Validate exception and error management
 * for a ProxyEndpoint.
 *
 * Compliance levels:
 * - PASS: non-empty DefaultFaultRule exists
 * - WARNING: non-empty FaultRule exists but no DefaultFaultRule
 * - ERROR: no valid error-handling mechanism found
 *
 * @param {Object} endpoint
 * @param {Function} cb
 */
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting endpoint "${endpoint.getName()}"`);

  const el = endpoint.getElement();
  const line = getNodeLine(el, 1);
  const column = getNodeColumn(el, 1);

  const status = getComplianceStatus(endpoint);

  if (status === 'PASS') {
    return cb(null, false);
  }

  if (status === 'WARNING') {
    endpoint.addMessage({
      plugin: warningPlugin,
      line,
      column,
      message:
        'FaultRule detected but no DefaultFaultRule found. Consider adding a DefaultFaultRule to provide default error handling.'
    });

    return cb(null, false);
  }

  endpoint.addMessage({
    plugin,
    line,
    column,
    message:
      'Missing exception and error management: no non-empty DefaultFaultRule or FaultRule found.'
  });

  return cb(null, true);
};

module.exports = {
  plugin,
  onProxyEndpoint
};