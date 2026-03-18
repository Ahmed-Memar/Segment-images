const ruleId = 'EX-CS008';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');
const SecurityLib = require('./lib/security-lib.js');

const plugin = {
    ruleId: ruleId,
    name: "CheckHTTPMethodsControlSOAP",
    message: "Ensure SOAP APIs explicitly restrict HTTP methods and reject unsupported verbs.",
    fatal: false,
    severity: 2, // 0 = off, 1 = warn, 2 = error
    nodeType: "Bundle",
    enabled: true,
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

/**
 * Returns true if at least one policy of the given type exists in the bundle.
 */
const hasPolicyType = function (endpoint, type) {
    return endpoint.parent.getPolicies().some(p => p.getType() === type);
};

/**
 * Returns all policies of the given type.
 */
const getPoliciesByType = function (endpoint, type) {
    return endpoint.parent.getPolicies().filter(p => p.getType() === type);
};

/**
 * Returns true if the bundle contains SOAP indicators.
 * Current logic:
 * - MessageValidation policy exists
 * Future extension possible:
 * - wsdl/xsd resources
 * - SOAPMessage element parsing
 */
const isSOAPApi = function (endpoint) {
    return hasPolicyType(endpoint, 'MessageValidation');
};

/**
 * Returns true if the bundle contains OASValidation.
 * Used to skip REST APIs already covered by EX-CS005.
 */
const isRESTApiCoveredByOAS = function (endpoint) {
    return hasPolicyType(endpoint, 'OASValidation');
};

/**
 * Returns true if a policy step name corresponds to a RaiseFault policy.
 */
const isRaiseFaultPolicyName = function (endpoint, policyName) {
    return getPoliciesByType(endpoint, 'RaiseFault')
        .some(p => p.getName() === policyName);
};

/**
 * Returns true if a policy step name corresponds to a FlowCallout policy.
 */
const isFlowCalloutPolicyName = function (endpoint, policyName) {
    return getPoliciesByType(endpoint, 'FlowCallout')
        .some(p => p.getName() === policyName);
};

/**
 * Check if a condition references request.verb.
 */
const conditionHasRequestVerb = function (condition) {
    return typeof condition === 'string' && condition.includes('request.verb');
};

/**
 * Check if condition contains a GET + wsdl exception pattern.
 * Simple heuristic only.
 */
const conditionLooksLikeWsdlGetException = function (condition) {
    if (typeof condition !== 'string') {
        return false;
    }

    const lower = condition.toLowerCase();
    return lower.includes('request.verb') &&
        lower.includes('"get"') &&
        lower.includes('request.queryparam.wsdl');
};

/**
 * Check if the ProxyEndpoint Description contains an explicit GET exception annotation.
 * Expected format:
 *   apigeelit:allow-method:GET:wsdl
 */
const hasGetExceptionAnnotation = function (endpoint) {
    try {
        const el = endpoint.getElement();
        const description = xpath.select('/ProxyEndpoint/Description', el);

        if (description.length === 0) {
            return false;
        }

        const value = (description[0].firstChild && description[0].firstChild.data
            ? description[0].firstChild.data
            : '').trim().toLowerCase();

        return value.includes('apigeelit:allow-method:get:wsdl');
    } catch (e) {
        debug('Could not read ProxyEndpoint Description: %s', e.message);
        return false;
    }
};

const onProxyEndpoint = function (endpoint, cb) {
    debug('Inspecting proxy endpoint "' + endpoint.getName() + '"');

    // ------------------------------------------------------------------
    // 1. REST covered by OASValidation -> skip with info-like behavior
    // ------------------------------------------------------------------
    if (isRESTApiCoveredByOAS(endpoint)) {
        if (typeof cb === 'function') {
            cb(null, false);
        }
        return;
    }

    // ------------------------------------------------------------------
    // 2. Unknown API type -> WARNING (not FAIL)
    // ------------------------------------------------------------------
    if (!isSOAPApi(endpoint)) {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: endpoint.getElement().lineNumber,
            column: endpoint.getElement().columnNumber,
            message:
                'HTTP Methods Control could not be verified: API type is indeterminate ' +
                '(no OASValidation and no MessageValidation detected).'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // ------------------------------------------------------------------
    // 3. SOAP -> check explicit method control
    // ------------------------------------------------------------------
    let foundVerbCheck = false;
    let foundRaiseFault = false;
    let foundPreFlowGuard = false;
    let foundFlowLevelGuard = false;
    let foundSharedFlowDelegation = false;
    let foundWsdlGetException = false;

    const proxyEl = endpoint.getElement();
    const proxyLine = proxyEl.lineNumber;
    const proxyColumn = proxyEl.columnNumber;

    // -----------------------------
    // A. Check PreFlow request steps
    // -----------------------------
    const preFlowConditions = xpath.select('/ProxyEndpoint/PreFlow/Request/Step/Condition', proxyEl);
    const preFlowNames = xpath.select('/ProxyEndpoint/PreFlow/Request/Step/Name', proxyEl);

    for (let i = 0; i < preFlowConditions.length; i++) {
        const condNode = preFlowConditions[i];
        const condition = (condNode.firstChild && condNode.firstChild.data)
            ? condNode.firstChild.data.trim()
            : '';

        if (conditionHasRequestVerb(condition)) {
            foundVerbCheck = true;
            foundPreFlowGuard = true;

            if (conditionLooksLikeWsdlGetException(condition)) {
                foundWsdlGetException = true;
            }

            const stepNameNode = preFlowNames[i];
            const stepName = (stepNameNode && stepNameNode.firstChild && stepNameNode.firstChild.data)
                ? stepNameNode.firstChild.data.trim()
                : '';

            if (isRaiseFaultPolicyName(endpoint, stepName)) {
                foundRaiseFault = true;
            }

            if (isFlowCalloutPolicyName(endpoint, stepName)) {
                foundSharedFlowDelegation = true;
            }
        }
    }

    // -----------------------------
    // B. Check Flow conditions
    // -----------------------------
    const flowConditions = xpath.select('/ProxyEndpoint/Flows/Flow/Condition', proxyEl);
    const flowNodes = xpath.select('/ProxyEndpoint/Flows/Flow', proxyEl);

    for (let i = 0; i < flowConditions.length; i++) {
        const condNode = flowConditions[i];
        const condition = (condNode.firstChild && condNode.firstChild.data)
            ? condNode.firstChild.data.trim()
            : '';

        if (conditionHasRequestVerb(condition)) {
            foundVerbCheck = true;
            foundFlowLevelGuard = true;

            if (conditionLooksLikeWsdlGetException(condition)) {
                foundWsdlGetException = true;
            }
        }
    }

    // -----------------------------
    // C. Check steps inside Flows
    // -----------------------------
    const flowStepNames = xpath.select('/ProxyEndpoint/Flows/Flow/Request/Step/Name', proxyEl);

    for (let i = 0; i < flowStepNames.length; i++) {
        const stepNameNode = flowStepNames[i];
        const stepName = (stepNameNode.firstChild && stepNameNode.firstChild.data)
            ? stepNameNode.firstChild.data.trim()
            : '';

        if (isRaiseFaultPolicyName(endpoint, stepName)) {
            foundRaiseFault = true;
        }

        if (isFlowCalloutPolicyName(endpoint, stepName)) {
            foundSharedFlowDelegation = true;
        }
    }

    // ------------------------------------------------------------------
    // 4. Decision logic
    // ------------------------------------------------------------------

    // FAIL: no request.verb check at all
    if (!foundVerbCheck) {
        endpoint.addMessage({
            plugin: plugin,
            line: proxyLine,
            column: proxyColumn,
            message:
                'SOAP API does not implement explicit HTTP method control. ' +
                'No condition referencing "request.verb" was found.'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // WARNING: shared flow delegation
    if (foundSharedFlowDelegation) {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: proxyLine,
            column: proxyColumn,
            message:
                'HTTP method control may be delegated to a shared flow (FlowCallout detected). ' +
                'Manual verification is required.'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // WARNING: request.verb check but no RaiseFault
    if (!foundRaiseFault) {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: proxyLine,
            column: proxyColumn,
            message:
                'HTTP method check detected for SOAP API, but no RaiseFault policy was found. ' +
                'Rejection of unsupported methods may be incomplete.'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // WARNING: only flow-level guard, no PreFlow protection
    if (!foundPreFlowGuard && foundFlowLevelGuard) {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: proxyLine,
            column: proxyColumn,
            message:
                'HTTP method control is implemented at Flow level but not in PreFlow. ' +
                'This is less robust and may not protect all request paths.'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // WARNING: WSDL GET pattern present but no explicit annotation
    if (foundWsdlGetException && !hasGetExceptionAnnotation(endpoint)) {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: proxyLine,
            column: proxyColumn,
            message:
                'SOAP API appears to allow HTTP GET for WSDL retrieval, but no explicit exception ' +
                'annotation was found in ProxyEndpoint Description. ' +
                'Expected annotation: "apigeelit:allow-method:GET:wsdl".'
        });

        if (typeof cb === 'function') {
            cb(null, true);
        }
        return;
    }

    // PASS: checker found explicit guard, RaiseFault, and no blocking ambiguity
    if (typeof cb === 'function') {
        cb(null, false);
    }
};

module.exports = {
    plugin,
    onProxyEndpoint,
};