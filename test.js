const ruleId = 'EX-CS004';

const debug = require('debug')('apigeelint:' + ruleId);

const {
    getFirstNode,
    PolicyChecker
} = require('./lib/security-lib.js');

const plugin = {
    ruleId: ruleId,
    name: "Check SpikeArrest",
    message: "Check if SpikeArrest is present and correctly configured",
    fatal: false,
    severity: 2, // 0 = off, 1 = warn, 2 = error
    nodeType: "Bundle",
    enabled: true,
};

const configCheckCallback = function(policy) {
    let compliant = true;

    let rate = getFirstNode('/SpikeArrest/Rate', policy.getElement());

    if (!rate) {
        compliant = false;
        policy.addMessage({
            plugin: plugin,
            line: policy.getElement().lineNumber,
            column: policy.getElement().columnNumber,
            message: `Required SpikeArrest configuration "Rate" not found for "${policy.getName()}".`
        });
    }

    return compliant;
};

const onProxyEndpoint = function(endpoint, cb) {
    debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

    let checker = new PolicyChecker(
        plugin,
        'SpikeArrest',
        debug,
        configCheckCallback
    );

    let hasIssue = checker.check(endpoint);

    if (typeof cb == 'function') {
        cb(null, hasIssue);
    }
};

module.exports = {
    plugin,
    onProxyEndpoint,
};