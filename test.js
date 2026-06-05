const onProxyEndpoint = function (endpoint, cb) {

    debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

    let hasIssue = false;

    const variableRegistry = buildVariableRegistry(endpoint);

    // ===== PRE-FLOW CHECK =====

    const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

    const preFlowJTP = getPoliciesFromStepsByType(
        endpoint,
        preFlowSteps,
        'JSONThreatProtection'
    );

    // Global protection already exists
    if (preFlowJTP.length > 0) {

        preFlowJTP.forEach(policy => {

            if (!configCheckCallback(policy)) {
                hasIssue = true;
            }
        });

        return cb(null, hasIssue);
    }

    // ===== PRE-FLOW JSON DEFAULT CHECK =====

    const preFlowXmlSteps = preFlowSteps.filter(step =>
        stepRequiresXMLProtection(
            endpoint,
            step,
            variableRegistry
        )
    );

    if (preFlowSteps.length > 0 && preFlowXmlSteps.length === 0) {

        hasIssue = true;

        endpoint.addMessage({
            plugin,
            line: preFlowSteps[0].lineNumber,
            column: preFlowSteps[0].columnNumber,
            message:
                'PreFlow is not compliant: ' +
                'a JSON request body is assumed by default, ' +
                'but no JSONThreatProtection policy is applied'
        });
    }

    // ===== FLOW-BY-FLOW VALIDATION =====

    const flowResults = findFlowsNotMatching(endpoint, (flow) => {

        const expression = getCondition(flow) || '';

        // Only request flows with body methods are validated by default
        if (!BODY_METHOD_REGEX.test(expression)) {
            return {
                isValid: true,
                details: []
            };
        }

        const steps = getFlowRequestSteps(flow) || [];

        // If XML is clearly detected, XMLThreatProtection plugin handles it
        const xmlSteps = steps.filter(step =>
            stepRequiresXMLProtection(
                endpoint,
                step,
                variableRegistry
            )
        );

        if (xmlSteps.length > 0) {
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

        // ===== Missing protection =====

        if (jtpPolicies.length === 0) {
            return {
                isValid: false,
                details: [{
                    line: flow.lineNumber,
                    column: flow.columnNumber,
                    severity: 'error',
                    message:
                        'a JSON request body is assumed by default, ' +
                        'but no JSONThreatProtection policy is applied'
                }]
            };
        }

        // ===== Invalid configuration =====

        const configValid = jtpPolicies.every(policy =>
            configCheckCallback(policy)
        );

        return {
            isValid: configValid,
            details: configValid
                ? []
                : jtpPolicies.map(policy => ({
                    line: flow.lineNumber,
                    column: flow.columnNumber,
                    severity: 'error',
                    message:
                        `Policy "${policy.getName()}" ` +
                        'has invalid JSONThreatProtection configuration'
                }))
        };
    });

    // ===== REPORT =====

    if (flowResults.length > 0) {

        hasIssue = true;

        flowResults.forEach(flow => {

            const errorDetails = flow.details.filter(
                d => d.severity === 'error'
            );

            if (errorDetails.length > 0) {

                const messages = errorDetails.map(detail =>
                    detail.stepName
                        ? `Step "${detail.stepName}" ${detail.message}`
                        : detail.message
                );

                endpoint.addMessage({
                    plugin,
                    line: errorDetails[0].line,
                    column: errorDetails[0].column,
                    message:
                        `Flow "${flow.name}" is not compliant: ` +
                        messages.join(' AND ')
                });
            }
        });
    }

    return cb(null, hasIssue);
};