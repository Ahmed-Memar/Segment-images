'use strict';

const xpath = require('xpath');

const { getPreFlowRequestSteps, getFlowRequestSteps } =
    require('./lib/security-lib');

const { stepUsesJSON } =
    require('./JSONThreatProtection');

const { stepUsesXML } =
    require('./XMLThreatProtection');

const ruleId = 'EX-CS004';

const plugin = {
    ruleId,
    name: 'Detect Unknown Payload Format',
    message:
        'Unable to detect JSON or XML usage indicators. Manual verification may be required.',
    fatal: false,
    severity: 1,
    nodeType: 'ProxyEndpoint',
    enabled: true
};

/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Logic:
 * - Detect JSON usage indicators
 * - Detect XML usage indicators
 * - If neither is detected → WARNING
 *
 * This plugin only analyses request flows.
 *
 * @param {Object} endpoint - Apigee ProxyEndpoint object
 * @param {Function} cb - Callback function
 * @returns {void}
 */
const onProxyEndpoint = function (endpoint, cb) {

    let hasJSON = false;
    let hasXML = false;

    // ===== PRE-FLOW CHECK =====

    const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

    preFlowSteps.forEach(step => {

        if (stepUsesJSON(endpoint, step)) {
            hasJSON = true;
        }

        if (stepUsesXML(endpoint, step)) {
            hasXML = true;
        }
    });

    // ===== FLOW CHECK =====

    const flows = endpoint.getFlows();

    flows.forEach(flow => {

        const steps = getFlowRequestSteps(flow) || [];

        steps.forEach(step => {

            if (stepUsesJSON(endpoint, step)) {
                hasJSON = true;
            }

            if (stepUsesXML(endpoint, step)) {
                hasXML = true;
            }
        });
    });

    // ===== REPORT =====

    if (!hasJSON && !hasXML) {

        endpoint.addMessage({
            plugin,
            line: endpoint.getElement().lineNumber,
            column: endpoint.getElement().columnNumber,
            message:
                'No JSON or XML usage indicators were detected in request flows. Manual verification may be required.'
        });

        return cb(null, true);
    }

    return cb(null, false);
};

module.exports = {
    plugin,
    onProxyEndpoint
};