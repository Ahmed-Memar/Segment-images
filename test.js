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
 * Check whether the endpoint defines a DefaultFaultRule.
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasDefaultFaultRule = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  return !!getFirstNode(`/${rootName}/DefaultFaultRule`, el);
};

/**
 * Check whether the endpoint defines at least one FaultRule.
 *
 * Empty FaultRules blocks do not count:
 *
 * Invalid:
 * <FaultRules/>
 *
 * Valid:
 * <FaultRules>
 *   <FaultRule .../>
 * </FaultRules>
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasNonEmptyFaultRules = endpoint => {
  const el = endpoint.getElement();
  const rootName = getEndpointRootName(endpoint);

  return !!getFirstNode(`/${rootName}/FaultRules/FaultRule`, el);
};

/**
 * Determine whether the endpoint implements
 * an exception/error handling mechanism.
 *
 * @param {Object} endpoint
 * @returns {boolean}
 */
const hasErrorHandling = endpoint =>
  hasDefaultFaultRule(endpoint) ||
  hasNonEmptyFaultRules(endpoint);

/**
 * Validate exception and error management
 * for a ProxyEndpoint or TargetEndpoint.
 *
 * A compliant endpoint must define:
 * - DefaultFaultRule
 * OR
 * - at least one FaultRule
 *
 * @param {Object} endpoint
 * @param {Function} cb
 */
const checkEndpoint = function (endpoint, cb) {
  debug(`Inspecting endpoint "${endpoint.getName()}"`);

  const el = endpoint.getElement();
  const line = getNodeLine(el, 1);
  const column = getNodeColumn(el, 1);

  if (hasErrorHandling(endpoint)) {
    return cb(null, false);
  }

  endpoint.addMessage({
    plugin,
    line,
    column,
    message:
      'Missing exception and error management: no DefaultFaultRule or non-empty FaultRules/FaultRule found.'
  });

  return cb(null, true);
};

module.exports = {
  plugin,
  onProxyEndpoint: checkEndpoint,
  onTargetEndpoint: checkEndpoint
};