/**
 * Determines whether a given Step uses JSON processing
 * and whether JSONThreatProtection validation is required.
 *
 * Rules:
 * - request / request.* / message / message.content / missing source => protected
 * - response / response.* => ignored
 * - private.* / AccessEntity.* / oauthv2.* => ignored
 * - ServiceCallout response variables:
 *      - hardcoded external URL => protected
 *      - otherwise => ignored
 * - unknown custom variables => warning only
 *
 * @param {Object} endpoint - Apigee endpoint object
 * @param {Node} step - XML Step node
 *
 * @returns {Object|null}
 */
const analyzeJSONUsage = function (endpoint, step) {
    const policy = getPolicyFromStep(endpoint, step);

    if (!policy) {
        return null;
    }

    // ===== ExtractVariables =====
    if (policy.getType() === 'ExtractVariables') {
        const jsonPayload = getFirstNode(
            '/ExtractVariables/JSONPayload',
            policy.getElement()
        );

        if (!jsonPayload) {
            return null;
        }

        const sourceNode = getFirstNode(
            '/ExtractVariables/Source',
            policy.getElement()
        );

        const source = sourceNode
            ? getNodeText(sourceNode).trim()
            : '';

        // Missing source => request by default
        if (!source) {
            return {
                requiresProtection: true,
                severity: 'error',
                details: [{
                    stepName: getStepName(step),
                    line: step.lineNumber,
                    column: step.columnNumber,
                    message:
                        'uses JSON but no JSONThreatProtection policy is applied'
                }]
            };
        }

        // request / message
        if (
            source === 'request' ||
            source.startsWith('request.') ||
            source === 'message' ||
            source === 'message.content'
        ) {
            return {
                requiresProtection: true,
                severity: 'error',
                details: [{
                    stepName: getStepName(step),
                    line: step.lineNumber,
                    column: step.columnNumber,
                    message:
                        'uses JSON but no JSONThreatProtection policy is applied'
                }]
            };
        }

        // response => ignore
        if (
            source === 'response' ||
            source.startsWith('response.')
        ) {
            return null;
        }

        // Internal variables => ignore
        if (
            source.startsWith('private.') ||
            source.startsWith('AccessEntity.') ||
            source.startsWith('oauthv2.')
        ) {
            return null;
        }

        // ===== ServiceCallout heuristic =====
        const allPolicies = endpoint.getPolicies();

        const matchingServiceCallout = allPolicies.find(p => {
            if (p.getType() !== 'ServiceCallout') {
                return false;
            }

            const responseNode = getFirstNode(
                '/ServiceCallout/Response',
                p.getElement()
            );

            if (!responseNode) {
                return false;
            }

            return getNodeText(responseNode).trim() === source;
        });

        if (matchingServiceCallout) {
            const targetUrlNode = getFirstNode(
                '/ServiceCallout/HTTPTargetConnection/URL',
                matchingServiceCallout.getElement()
            );

            if (targetUrlNode) {
                const url = getNodeText(targetUrlNode).trim();

                const isVariableUrl =
                    url.includes('{') || url.includes('}');

                const isInternal =
                    url.includes('localhost') ||
                    url.includes('.local') ||
                    url.includes('.internal');

                // Hardcoded external URL => ERROR
                if (!isVariableUrl && !isInternal) {
                    return {
                        requiresProtection: true,
                        severity: 'error',
                        details: [{
                            stepName: getStepName(step),
                            line: step.lineNumber,
                            column: step.columnNumber,
                            message:
                                'uses JSON but no JSONThreatProtection policy is applied'
                        }]
                    };
                }
            }

            // Internal / variable-based ServiceCallout => ignore
            return null;
        }

        // Unknown custom variable => warning
        return {
            requiresProtection: false,
            severity: 'warning',
            details: [{
                stepName: getStepName(step),
                line: step.lineNumber,
                column: step.columnNumber,
                message:
                    'uses JSON from unknown source but source origin cannot be determined'
            }]
        };
    }

    // ===== JSON Transformations =====
    if (['JSONToXML'].includes(policy.getType())) {
        return {
            requiresProtection: true,
            severity: 'error',
            details: [{
                stepName: getStepName(step),
                line: step.lineNumber,
                column: step.columnNumber,
                message:
                    'uses JSON but no JSONThreatProtection policy is applied'
            }]
        };
    }

    // ===== AssignMessage =====
    if (policy.getType() === 'AssignMessage') {
        const headers = xpath.select(
            '/AssignMessage/Set/Headers/Header[@name="Content-Type" or @name="content-type"]',
            policy.getElement()
        );

        const usesJson = headers.some(h =>
            getNodeText(h)
                .toLowerCase()
                .includes('application/json')
        );

        if (usesJson) {
            return {
                requiresProtection: true,
                severity: 'error',
                details: [{
                    stepName: getStepName(step),
                    line: step.lineNumber,
                    column: step.columnNumber,
                    message:
                        'uses JSON but no JSONThreatProtection policy is applied'
                }]
            };
        }
    }

    return null;
};



// ===== PRE-FLOW CHECK =====

const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

const preFlowJTP = getPoliciesFromStepsByType(
    endpoint,
    preFlowSteps,
    'JSONThreatProtection'
);

// If PreFlow has JTP -> global protection
if (preFlowJTP.length > 0) {
    preFlowJTP.forEach(policy => {
        if (!configCheckCallback(policy)) {
            hasIssue = true;
        }
    });

    return cb(null, hasIssue);
}

const preFlowResults = preFlowSteps
    .map(step => analyzeJSONUsage(endpoint, step))
    .filter(Boolean);

const preFlowProtected = preFlowResults.filter(
    r => r.requiresProtection
);

const preFlowWarnings = preFlowResults.filter(
    r => r.severity === 'warning'
);

// Errors
if (preFlowProtected.length > 0) {
    hasIssue = true;

    preFlowProtected.forEach(r => {
        r.details.forEach(detail => {
            endpoint.addMessage({
                plugin,
                line: detail.line,
                column: detail.column,
                message:
                    `PreFlow is not compliant: ` +
                    `Step "${detail.stepName}" ${detail.message}`
            });
        });
    });
}

// Warnings
preFlowWarnings.forEach(r => {
    r.details.forEach(detail => {
        endpoint.addMessage({
            plugin: warningPlugin,
            line: detail.line,
            column: detail.column,
            message:
                `PreFlow warning: ` +
                `Step "${detail.stepName}" ${detail.message}`
        });
    });
});




// ===== FLOW CHECK =====

const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

    const steps = getFlowRequestSteps(flow) || [];

    const analysisResults = steps
        .map(step => analyzeJSONUsage(endpoint, step))
        .filter(Boolean);

    const protectedResults = analysisResults.filter(
        r => r.requiresProtection
    );

    const warningResults = analysisResults.filter(
        r => r.severity === 'warning'
    );

    if (protectedResults.length === 0 &&
        warningResults.length === 0) {
        return {
            isValid: true,
            details: []
        };
    }

    const jtpPolicies = getPoliciesFromStepsByType(
        endpoint,
        steps,
        'JSONThreatProtection'
    );

    // Missing protection
    if (protectedResults.length > 0 &&
        jtpPolicies.length === 0) {

        return {
            isValid: false,
            details: protectedResults.flatMap(r => r.details)
        };
    }

    // Invalid configuration
    const configValid = jtpPolicies.every(policy =>
        configCheckCallback(policy)
    );

    return {
        isValid: configValid,
        details: configValid
            ? warningResults.flatMap(r => r.details)
            : [{
                line: flow.lineNumber,
                column: flow.columnNumber,
                message:
                    'has invalid JSONThreatProtection configuration'
            }]
    };
});




// ===== REPORT =====

if (invalidFlows.length > 0) {
    hasIssue = true;

    invalidFlows.forEach(flow => {

        const messages = flow.details.map(d =>
            d.stepName
                ? `Step "${d.stepName}" ${d.message}`
                : d.message
        );

        const hasWarningOnly = flow.details.every(d =>
            d.message.includes('unknown source')
        );

        endpoint.addMessage({
            plugin: hasWarningOnly ? warningPlugin : plugin,
            line: flow.line,
            column: flow.column,
            message:
                `Flow "${flow.name}" is not compliant: ` +
                `${messages.join(' AND ')}`
        });
    });
}