const buildVariableRegistry = function(endpoint) {
    const registry = {
        serviceCalloutResponses: new Set(),
        ignoredVariables: new Set([
            'response',
            'message',
            'request'
        ])
    };

    const steps = [
        ...getPreFlowRequestSteps(endpoint),
        ...getFlowRequestSteps(endpoint)
            .flatMap(flow => getFlowRequestSteps(flow) || [])
    ];

    steps.forEach(step => {
        const policy = getPolicyFromStep(endpoint, step);
        if (!policy) return;

        // ServiceCallout
        if (policy.getType() === 'ServiceCallout') {
            const responseNode = getFirstNode(
                '/ServiceCallout/Response',
                policy.getElement()
            );

            if (responseNode) {
                const responseVar = getNodeText(responseNode);

                if (responseVar) {
                    registry.serviceCalloutResponses.add(responseVar);
                }
            }
        }
    });

    return registry;
};









const classifySource = function(source, registry) {

    // Missing source => request/message by default
    if (!source) {
        return {
            shouldCheck: true,
            unknown: false
        };
    }

    const normalizedSource = source.trim();

    // Direct request sources
    if (
        normalizedSource === 'request' ||
        normalizedSource.startsWith('request.') ||
        normalizedSource === 'message' ||
        normalizedSource.startsWith('message.')
    ) {
        return {
            shouldCheck: true,
            unknown: false
        };
    }

    // Explicit safe sources
    if (
        normalizedSource === 'response' ||
        normalizedSource.startsWith('response.') ||
        normalizedSource.startsWith('AccessEntity.') ||
        normalizedSource.startsWith('private.') ||
        normalizedSource.startsWith('oauthv2.')
    ) {
        return {
            shouldCheck: false,
            unknown: false
        };
    }

    // Custom variable
    const baseVar = normalizedSource.split('.')[0];

    // Known ServiceCallout response
    if (registry.serviceCalloutResponses.has(baseVar)) {
        return {
            shouldCheck: false,
            unknown: false
        };
    }

    // Unknown source
    return {
        shouldCheck: false,
        unknown: true
    };
};







const stepUsesJSON = function(endpoint, step, registry) {

    const policy = getPolicyFromStep(endpoint, step);

    if (!policy) {
        return {
            usesJson: false
        };
    }

    // ===== ExtractVariables =====
    if (policy.getType() === 'ExtractVariables') {

        const jsonPayload = getFirstNode(
            '/ExtractVariables/JSONPayload',
            policy.getElement()
        );

        if (!jsonPayload) {
            return {
                usesJson: false
            };
        }

        const sourceNode = getFirstNode(
            '/ExtractVariables/Source',
            policy.getElement()
        );

        const source = sourceNode
            ? getNodeText(sourceNode)
            : null;

        const analysis = classifySource(source, registry);

        if (!analysis.shouldCheck && !analysis.unknown) {
            return {
                usesJson: false
            };
        }

        return {
            usesJson: true,
            unknown: analysis.unknown
        };
    }

    // ===== JSON transformation policies =====
    if (['JSONToXML'].includes(policy.getType())) {
        return {
            usesJson: true,
            unknown: false
        };
    }

    // ===== AssignMessage with JSON Content-Type =====
    if (policy.getType() === 'AssignMessage') {

        const headers = xpath.select(
            '/AssignMessage/Set/Headers/Header[@name="Content-Type" or @name="content-type"]',
            policy.getElement()
        );

        const hasJsonHeader = headers.some(h =>
            getNodeText(h)
                .toLowerCase()
                .includes('application/json')
        );

        return {
            usesJson: hasJsonHeader,
            unknown: false
        };
    }

    return {
        usesJson: false
    };
};







const onProxyEndpoint = function(endpoint, cb) {

    debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

    let hasIssue = false;

    const registry = buildVariableRegistry(endpoint);

    // ===== PRE-FLOW CHECK =====

    const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

    const preFlowJTP = getPoliciesFromStepsByType(
        endpoint,
        preFlowSteps,
        'JSONThreatProtection'
    );

    // Global protection exists
    if (preFlowJTP.length > 0) {

        preFlowJTP.forEach(policy => {
            if (!configCheckCallback(policy)) {
                hasIssue = true;
            }
        });

        return cb(null, hasIssue);
    }

    // Detect JSON usage
    const preFlowJsonResults = preFlowSteps
        .map(step => ({
            step,
            analysis: stepUsesJSON(endpoint, step, registry)
        }))
        .filter(r => r.analysis.usesJson);

    if (preFlowJsonResults.length > 0) {

        hasIssue = true;

        preFlowJsonResults.forEach(r => {

            endpoint.addMessage({
                plugin,
                line: r.step.lineNumber,
                column: r.step.columnNumber,
                message:
                    `PreFlow is not compliant: ` +
                    `Step "${getStepName(r.step)}" ` +
                    (r.analysis.unknown
                        ? 'uses JSON from unknown source but no JSONThreatProtection policy is applied'
                        : 'uses JSON but no JSONThreatProtection policy is applied')
            });

        });
    }

    // ===== FLOW CHECK =====

    const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

        const steps = getFlowRequestSteps(flow) || [];

        const jsonResults = steps
            .map(step => ({
                step,
                analysis: stepUsesJSON(endpoint, step, registry)
            }))
            .filter(r => r.analysis.usesJson);

        if (jsonResults.length === 0) {
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
        if (jtpPolicies.length === 0) {

            return {
                isValid: false,
                details: jsonResults.map(r => ({
                    stepName: getStepName(r.step),
                    line: r.step.lineNumber,
                    column: r.step.columnNumber,
                    message: r.analysis.unknown
                        ? 'uses JSON from unknown source but no JSONThreatProtection policy is applied'
                        : 'uses JSON but no JSONThreatProtection policy is applied'
                }))
            };
        }

        // Invalid configuration
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
                    message:
                        `Policy "${policy.getName()}" ` +
                        'has invalid JSONThreatProtection configuration'
                }))
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

            endpoint.addMessage({
                plugin,
                line: flow.line,
                column: flow.column,
                message:
                    `Flow "${flow.name}" is not compliant: ` +
                    messages.join(' AND ')
            });

        });
    }

    return cb(null, hasIssue);
};