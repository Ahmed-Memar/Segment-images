const ruleId = 'EX-CS003';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');

const {
    findFlowsNotMatching,
    getPreFlowRequestSteps,
    getFlowRequestSteps,
    getStepName
} = require('./lib/security-lib.js');

const plugin = {
    ruleId: ruleId,
    name: "Check XMLThreatProtection",
    message: "Checks if XMLThreatProtection is present and correctly configured",
    fatal: false,
    severity: 2,
    nodeType: "Bundle",
    enabled: true,
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

/**
 * Validates XMLThreatProtection configuration.
 *
 * ERROR:
 * - Missing StructureLimits/NodeDepth
 * - Missing StructureLimits/ChildCount
 *
 * WARNING:
 * - Missing ValueLimits/Text
 * - Missing ValueLimits/Attribute
 * - Missing StructureLimits/AttributeCountPerElement
 *
 * @param {Object} policy - ApigeeLint policy object
 * @returns {boolean} - false if an ERROR is detected, true otherwise
 */
const configCheckCallback = function (policy) {
    const element = policy.getElement();

    const errorFields = [
        'StructureLimits/NodeDepth',
        'StructureLimits/ChildCount'
    ];

    const warningFields = [
        'ValueLimits/Text',
        'ValueLimits/Attribute',
        'StructureLimits/AttributeCountPerElement'
    ];

    const getFieldNodes = (fieldPath) =>
        xpath.select(`/XMLThreatProtection/${fieldPath}`, element);

    let hasError = false;

    const missingErrorFields = errorFields.filter(fieldPath => {
        return getFieldNodes(fieldPath).length === 0;
    });

    if (missingErrorFields.length > 0) {
        hasError = true;

        policy.addMessage({
            plugin: plugin,
            line: element.lineNumber,
            column: element.columnNumber,
            message: `XMLThreatProtection "${policy.getName()}" is missing required configuration fields: ${missingErrorFields.join(', ')}`
        });
    }

    const missingWarningFields = warningFields.filter(fieldPath => {
        return getFieldNodes(fieldPath).length === 0;
    });

    if (missingWarningFields.length > 0) {
        policy.addMessage({
            plugin: warningPlugin,
            line: element.lineNumber,
            column: element.columnNumber,
            message: `XMLThreatProtection "${policy.getName()}" is missing recommended configuration fields: ${missingWarningFields.join(', ')}`
        });
    }

    return !hasError;
};

// Get text from XML node
const getNodeText = function (node) {
    return node && node.firstChild && node.firstChild.data
        ? node.firstChild.data.trim()
        : '';
};

// Get policy object by name
const getPolicyByName = function (endpoint, name) {
    return endpoint.parent.getPolicies().find(p => p.getName() === name);
};

const getPolicyFromStep = function (endpoint, step) {
    const name = getStepName(step);
    if (!name) return null;
    return getPolicyByName(endpoint, name);
};

/**
 * Determines whether a Step uses XML processing.
 *
 * XML indicators:
 * - ExtractVariables with <XMLPayload>
 * - XMLToJSON / JSONToXML / XSLTransform
 * - AssignMessage setting Content-Type to application/xml or text/xml
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @param {Node} step - XML Step node
 * @returns {boolean}
 */
const stepUsesXML = function (endpoint, step) {
    const policy = getPolicyFromStep(endpoint, step);
    if (!policy) return false;

    const policyType = policy.getType();

    if (policyType === 'ExtractVariables') {
        const xmlPayload = xpath.select('/ExtractVariables/XMLPayload', policy.getElement());
        return xmlPayload.length > 0;
    }

    if (['XMLToJSON', 'JSONToXML', 'XSLTransform', 'XSLTransformation'].includes(policyType)) {
        return true;
    }

    if (policyType === 'AssignMessage') {
        const headers = xpath.select(
            '/AssignMessage//Headers/Header[@name="Content-Type" or @name="content-type"]',
            policy.getElement()
        );

        return headers.some(h => {
            const value = getNodeText(h).toLowerCase();
            return value.includes('application/xml') || value.includes('text/xml');
        });
    }

    return false;
};

/**
 * Extracts XMLThreatProtection policies from a list of steps.
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @param {Array<Node>} steps - Step nodes
 * @returns {Array<Object>}
 */
const getXMLTPPoliciesFromSteps = function (endpoint, steps) {
    return steps
        .map(step => getPolicyFromStep(endpoint, step))
        .filter(p => p && p.getType() === 'XMLThreatProtection');
};

/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Logic:
 * - Request flow only
 * - If XMLThreatProtection exists in PreFlow → global protection
 * - If XML is used without XMLThreatProtection → ERROR
 * - If XMLThreatProtection config is incomplete → ERROR/WARNING
 *
 * @param {Object} endpoint - Apigee ProxyEndpoint object
 * @param {Function} cb - Callback
 */
const onProxyEndpoint = function (endpoint, cb) {
    debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

    let hasIssue = false;

    // ===== PRE-FLOW CHECK =====

    const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];
    const preFlowXMLTP = getXMLTPPoliciesFromSteps(endpoint, preFlowSteps);

    // If PreFlow has XMLThreatProtection → global protection
    if (preFlowXMLTP.length > 0) {
        preFlowXMLTP.forEach(policy => {
            if (!configCheckCallback(policy)) {
                hasIssue = true;
            }
        });

        return cb(null, hasIssue);
    }

    // If PreFlow uses XML but no XMLThreatProtection
    const preFlowXMLSteps = preFlowSteps.filter(step => stepUsesXML(endpoint, step));

    if (preFlowXMLSteps.length > 0) {
        hasIssue = true;

        endpoint.addMessage({
            plugin,
            line: endpoint.getElement().lineNumber,
            column: endpoint.getElement().columnNumber,
            message: `PreFlow is not compliant: step(s) ${preFlowXMLSteps.map(s => `"${getStepName(s)}"`).join(', ')} use XML but no XMLThreatProtection found`
        });
    }

    // ===== FLOW CHECK =====

    const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
        const steps = getFlowRequestSteps(flow) || [];

        const xmlSteps = steps.filter(step => stepUsesXML(endpoint, step));

        if (xmlSteps.length === 0) {
            return { isValid: true, details: [] };
        }

        const xmltpPolicies = getXMLTPPoliciesFromSteps(endpoint, steps);

        // Missing XMLThreatProtection
        if (xmltpPolicies.length === 0) {
            return {
                isValid: false,
                details: xmlSteps.map(step => ({
                    message: `Flow "${flow.getAttribute('name')}" - Step "${getStepName(step)}" uses XML but no XMLThreatProtection found`,
                    line: step.lineNumber,
                    column: step.columnNumber
                }))
            };
        }

        // Invalid XMLThreatProtection configuration
        const configValid = xmltpPolicies.every(policy => configCheckCallback(policy));

        return {
            isValid: configValid,
            details: configValid ? [] : [{
                message: `Invalid XMLThreatProtection configuration in flow "${flow.getAttribute('name')}"`,
                line: flow.lineNumber,
                column: flow.columnNumber
            }]
        };
    });

    // ===== REPORT =====

    if (invalidFlows.length > 0) {
        hasIssue = true;

        invalidFlows.forEach(flow => {
            const messages = flow.details.map(d => d.message);

            endpoint.addMessage({
                plugin,
                line: flow.line,
                column: flow.column,
                message: `Flow "${flow.getAttribute('name')}" is not compliant: ${messages.join(' AND ')}`
            });
        });
    }

    return cb(null, hasIssue);
};

module.exports = {
    plugin,
    onProxyEndpoint,
};